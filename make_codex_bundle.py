# scripts/make_codex_bundle.py
# -*- coding: utf-8 -*-
"""
Empaqueta en un ZIP los archivos necesarios para el nuevo chat de diagnóstico.
Ejecútalo desde la raíz del repo o pasa --repo-root con la ruta al repo.

Uso:
  python scripts/make_codex_bundle.py
  python scripts/make_codex_bundle.py --out codex_bundle.zip
  python scripts/make_codex_bundle.py --include-debug
  python scripts/make_codex_bundle.py --repo-root C:\Ruta\al\repo --out C:\salida\bundle.zip
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


# Conjunto base de archivos a incluir (rutas relativas a la raíz del repo)
REQUIRED_PATHS = [
    # apps/main-ui
    "apps/main-ui/src/main.tsx",
    "apps/main-ui/src/index.css",
    "apps/main-ui/src/App.tsx",
    "apps/main-ui/tailwind.config.cjs",
    "apps/main-ui/postcss.config.cjs",
    "apps/main-ui/vite.config.ts",
    "apps/main-ui/package.json",
    # packages/ui
    "packages/ui/tailwind-preset.cjs",
    "packages/ui/dist/styles.css",
    # raíz
    "package.json",
]

# Opcionales útiles
OPTIONAL_PATTERNS = [
    # tailwind config en la raíz, si existiera
    "tailwind.config.*",
]

# Debug opcional (si --include-debug)
DEBUG_PATHS = [
    "apps/main-ui/.debug/tw.css",
]


def gather_files(repo_root: Path, include_debug: bool) -> tuple[list[Path], list[Path]]:
    """Devuelve (presentes, faltantes) como Paths absolutos, conservando estructura relativa."""
    present: list[Path] = []
    missing: list[Path] = []

    def rel(p: Path) -> Path:
        try:
            return p.relative_to(repo_root)
        except Exception:
            return p

    # Requeridos
    for rel_path in REQUIRED_PATHS:
        p = repo_root / rel_path
        if p.exists():
            present.append(p)
        else:
            missing.append(p)

    # Opcionales por patrón (en raíz)
    for pattern in OPTIONAL_PATTERNS:
        for p in repo_root.glob(pattern):
            if p.is_file():
                present.append(p)

    # Debug opcional
    if include_debug:
        for rel_path in DEBUG_PATHS:
            p = repo_root / rel_path
            if p.exists():
                present.append(p)
            else:
                # no es error si no existe; solo informativo
                missing.append(p)

    # Deduplicar manteniendo orden
    seen: set[Path] = set()
    dedup_present: list[Path] = []
    for p in present:
        if p not in seen:
            seen.add(p)
            dedup_present.append(p)

    # Filtrar faltantes de los que estén presentes
    dedup_missing = [m for m in missing if m not in seen]

    # Orden estable por ruta relativa para que el zip sea reproducible
    dedup_present.sort(key=lambda p: str(rel(p)).lower())

    return dedup_present, dedup_missing


def make_zip(repo_root: Path, out_path: Path, files: list[Path]) -> None:
    """Crea el zip preservando rutas relativas a la raíz del repo."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(out_path, "w", compression=ZIP_DEFLATED) as zf:
        for abs_path in files:
            arcname = abs_path.relative_to(repo_root).as_posix()
            zf.write(abs_path, arcname=arcname)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Empaqueta archivos para el diagnóstico de Codex.")
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Ruta a la raíz del repo (por defecto: directorio actual).",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("codex_bundle.zip"),
        help="Ruta/nombre del ZIP de salida (por defecto: codex_bundle.zip).",
    )
    parser.add_argument(
        "--include-debug",
        action="store_true",
        help="Incluye apps/main-ui/.debug/tw.css si existe.",
    )
    args = parser.parse_args(argv)

    repo_root: Path = args.repo_root.resolve()
    out_path: Path = args.out.resolve()

    if not repo_root.exists():
        print(f"[ERROR] repo-root no existe: {repo_root}", file=sys.stderr)
        return 2

    files, missing = gather_files(repo_root, include_debug=args.include_debug)

    print("== NexusG Codex Bundle ==")
    print(f"Repo root : {repo_root}")
    print(f"Salida ZIP: {out_path}")
    print("\nArchivos incluidos:")
    for f in files:
        print("  +", f.relative_to(repo_root).as_posix())

    if missing:
        print("\n(No bloqueante) No encontrados:")
        for m in missing:
            # solo mostrar rutas relativas si pertenecen al repo
            try:
                print("  -", m.relative_to(repo_root).as_posix())
            except Exception:
                print("  -", str(m))

    if not files:
        print("\n[ERROR] No hay archivos para empaquetar.", file=sys.stderr)
        return 3

    make_zip(repo_root, out_path, files)
    print(f"\nOK: ZIP creado en {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
