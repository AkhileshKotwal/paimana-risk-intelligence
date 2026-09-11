"""
PAIMANA Flash Report PDF Ingestion & Extraction Engine.
Extracts Table 6 ("All Ongoing Projects Costing ₹150 Cr and Above") into structured project records.
Designed to support continuous monthly updates (April, May, June, July, August 2026+).
"""
from pathlib import Path
import argparse
import csv
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
TWO_PAREN_RE = re.compile(r'^\(.*\)\s*\(.*\)$')

def find_start_page(pdf):
    """Find the Table 6 DIVIDER page and return the page immediately following it."""
    candidates = []
    for i, page in enumerate(pdf.pages):
        text = page.extract_text() or ""
        if "Table 6" in text and "All Ongoing Projects" in text and len(text) < 400:
            candidates.append(i)
    if candidates:
        return candidates[-1] + 1
    return None

def parse_multiline_name(cell):
    """Parses project name cell extracting project name, agency, project code, and legacy OCMS code."""
    if cell is None:
        return None, None, None, None
    lines = [l.strip() for l in cell.split("\n") if l.strip()]
    if len(lines) < 2:
        return cell.strip(), None, None, None
    legacy_code, pmgid = None, None
    if TWO_PAREN_RE.match(lines[-1]):
        legacy_pmgid_line = lines.pop()
        parts = re.findall(r'\(([^)]*)\)', legacy_pmgid_line)
        if len(parts) >= 2:
            legacy_code, pmgid = parts[0].strip(), parts[1].strip()
    code = lines.pop().strip("() ") if lines else None
    agency = lines.pop().strip("() ") if lines else None
    name = " ".join(lines).strip()
    return name, agency, code, legacy_code

def parse_pair(cell):
    """Split a dual-value cell (e.g. '04/1996\\n(12/1996)') into (top, bottom)."""
    if cell is None:
        return None, None
    lines = [l.strip() for l in cell.split("\n") if l.strip()]
    if len(lines) == 0:
        return None, None
    top = lines[0]
    bottom = lines[1].strip("() ") if len(lines) > 1 else None
    return top, bottom

def extract_month_from_pdf(pdf_path, month_label):
    """Extracts all ongoing projects from a single Flash Report PDF."""
    try:
        import pdfplumber
    except ImportError:
        print("pdfplumber is required for PDF parsing. Install via pip install pdfplumber", file=sys.stderr)
        return []

    pdf_file = Path(pdf_path)
    if not pdf_file.exists():
        print(f"Warning: PDF file not found at {pdf_path}", file=sys.stderr)
        return []

    records = []
    with pdfplumber.open(pdf_file) as pdf:
        start = find_start_page(pdf)
        if start is None:
            print(f"[{month_label}] Table 6 divider page not located in {pdf_file.name}", file=sys.stderr)
            return []

        ministry, sector = None, None
        for i in range(start, len(pdf.pages)):
            page = pdf.pages[i]
            tables = page.find_tables()
            if not tables:
                continue
            for t in tables:
                rows = t.extract()
                for row in rows:
                    if not row or len(row) < 8:
                        continue
                    sl, name_cell, state, dt_appr, doc_cell, cost_cell, exp, prog = row[:8]
                    sl = (sl or "").strip()
                    if sl == "Sl.No":
                        continue
                    if sl == "" and name_cell and not state and not dt_appr:
                        label = name_cell.strip()
                        if label.lower().startswith("total"):
                            continue
                        if re.search(r"\b(Ministry|Department)\b", label, re.I):
                            ministry = label
                        else:
                            sector = label
                        continue
                    if sl == "" or not sl.isdigit():
                        continue

                    name, agency, code, legacy_code = parse_multiline_name(name_cell)
                    appr_date, start_date = parse_pair(dt_appr)
                    target_doc, revised_doc = parse_pair(doc_cell)
                    orig_cost, revised_cost = parse_pair(cost_cell)
                    state_clean = (state or "").replace("\n", " ").strip()

                    records.append({
                        "month": month_label,
                        "sl_no": sl,
                        "project_code": code,
                        "legacy_ocms_code": legacy_code,
                        "project_name": name,
                        "agency": agency,
                        "ministry": ministry,
                        "sector": sector,
                        "state": state_clean,
                        "date_of_approval": appr_date,
                        "start_date": start_date,
                        "target_doc": target_doc,
                        "revised_doc": revised_doc,
                        "original_cost_cr": orig_cost,
                        "revised_cost_cr": revised_cost,
                        "cumulative_expenditure_cr": (exp or "").strip(),
                        "physical_progress_pct": (prog or "").strip(),
                    })
    return records

def parse_directory(input_dir, output_csv):
    """Scans directory for Flash Report PDFs and generates consolidated CSV."""
    in_dir = Path(input_dir)
    pdf_files = sorted(in_dir.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDF files found in {input_dir}")
        return

    all_records = []
    month_regex = re.compile(r'(April|May|June|July|August|September|October|November|December|Jan|Feb|Mar)[-_ ]?(\d{4})', re.I)
    month_map = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'april': '04',
        'may': '05', 'jun': '06', 'june': '06', 'jul': '07', 'july': '07',
        'aug': '08', 'august': '08', 'sep': '09', 'september': '09',
        'oct': '10', 'october': '10', 'nov': '11', 'november': '11',
        'dec': '12', 'december': '12'
    }

    for pdf in pdf_files:
        match = month_regex.search(pdf.name)
        if match:
            m_str, y_str = match.groups()
            m_num = month_map.get(m_str.lower()[:3], '01')
            month_label = f"{y_str}-{m_num}"
        else:
            month_label = pdf.stem

        print(f"Processing {pdf.name} -> {month_label}...")
        recs = extract_month_from_pdf(pdf, month_label)
        print(f"  Extracted {len(recs)} projects")
        all_records.extend(recs)

    if all_records:
        out_path = Path(output_csv)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        cols = list(all_records[0].keys())
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(all_records)
        print(f"Wrote {len(all_records):,} total project records to {output_csv}")

def main():
    parser = argparse.ArgumentParser(description="Extract PAIMANA Table 6 ongoing projects from Flash Report PDFs.")
    parser.add_argument("--input-dir", default=str(ROOT / "data" / "raw_pdfs"), help="Directory containing Flash Report PDFs")
    parser.add_argument("--output", default=str(ROOT / "data" / "paimana_projects_extracted.csv"), help="Output CSV path")
    args = parser.parse_args()
    parse_directory(args.input_dir, args.output)

if __name__ == "__main__":
    main()
