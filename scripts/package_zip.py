"""Package the entire PAIMANA SIH-winning prototype into a distribution ZIP."""
import os
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
ZIP_OUT = ROOT.parent / "paimana_sih_winning_prototype.zip"
EXCLUDES = {"node_modules", ".git", "__pycache__", ".pytest_cache", ".DS_Store"}


def main():
    print(f"Creating distribution ZIP from {ROOT}...")
    file_count = 0
    with zipfile.ZipFile(ZIP_OUT, "w", zipfile.ZIP_DEFLATED) as zf:
        for base, dirs, files in os.walk(ROOT):
            dirs[:] = [d for d in dirs if d not in EXCLUDES]
            for f in files:
                if f in EXCLUDES or f.endswith(".pyc"):
                    continue
                fp = Path(base) / f
                arcname = fp.relative_to(ROOT.parent)
                zf.write(fp, arcname)
                file_count += 1

    size_mb = ZIP_OUT.stat().st_size / (1024 * 1024)
    print(f"Successfully packaged {file_count:,} files into {ZIP_OUT} ({size_mb:.2f} MB)")


if __name__ == "__main__":
    main()
