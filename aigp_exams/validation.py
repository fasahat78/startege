#!/usr/bin/env python3
"""
Validate AIGP exam batch JSON files.

What it validates:
1) JSON Schema compliance (Draft 2020-12)
2) Stronger rules not expressible (or not enforced) in schema:
   - options contain exactly one each of A/B/C/D (unique keys)
   - correct_answer is one of the option keys
   - option texts are unique within a question (no duplicates)
   - question IDs are unique across all files validated in this run
   - (optional) validates expected per-batch domain counts (I=4, II=6, III=6, IV=4) when batch has 20 items
   - (optional) basic pattern sanity checks on answer key (max run)
   - (optional) recompute analytics and compare with provided analytics

Usage:
  python validate_aigp_json.py --schema aigp-exam-batch.schema.json ./data/**/*.json
  python validate_aigp_json.py --schema aigp-exam-batch.schema.json --strict-analytics ./exam3.1.json ./exam3.2.json

Exit code:
  0 if all files pass
  1 if any file fails
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

try:
    import jsonschema
except ImportError:
    print("Missing dependency: jsonschema. Install with: pip install jsonschema", file=sys.stderr)
    sys.exit(2)


ALLOWED_OPTION_KEYS = {"A", "B", "C", "D"}
ALLOWED_DOMAINS = {"I", "II", "III", "IV"}
ALLOWED_DIFFICULTY = {"easy", "medium", "hard"}
ALLOWED_JURISDICTION = {"US", "EU", "Other", "Mixed"}


@dataclass
class ValidationIssue:
    file: str
    message: str
    path: str = ""

    def __str__(self) -> str:
        p = f" @ {self.path}" if self.path else ""
        return f"[{self.file}]{p} {self.message}"


def load_json(path: str) -> Any:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_schema(schema_path: str) -> Dict[str, Any]:
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_files(patterns: List[str]) -> List[str]:
    files: List[str] = []
    for p in patterns:
        matches = glob.glob(p, recursive=True)
        if matches:
            files.extend(matches)
        elif os.path.isfile(p):
            files.append(p)
    # Deduplicate while preserving order
    seen = set()
    out = []
    for f in files:
        if f not in seen:
            seen.add(f)
            out.append(f)
    return out


def jsonschema_validate(instance: Any, schema: Dict[str, Any], file: str) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    validator = jsonschema.Draft202012Validator(schema)
    for err in sorted(validator.iter_errors(instance), key=str):
        path = "/" + "/".join([str(p) for p in err.path]) if err.path else ""
        issues.append(ValidationIssue(file=file, message=err.message, path=path))
    return issues


def max_run(seq: List[str]) -> int:
    if not seq:
        return 0
    best = 1
    cur = 1
    for i in range(1, len(seq)):
        if seq[i] == seq[i - 1]:
            cur += 1
            best = max(best, cur)
        else:
            cur = 1
    return best


def recompute_analytics(batch: Dict[str, Any]) -> Dict[str, Any]:
    qs = batch.get("questions", [])
    domain_counts = Counter(q.get("domain") for q in qs)
    diff_counts = Counter(q.get("difficulty") for q in qs)
    jur_counts = Counter(q.get("jurisdiction") for q in qs)
    case_count = sum(1 for q in qs if q.get("is_case_study") is True)
    ans_dist = Counter(q.get("correct_answer") for q in qs)

    # Normalize keys
    domain_out = {k: int(domain_counts.get(k, 0)) for k in ["I", "II", "III", "IV"]}
    diff_out = {k: int(diff_counts.get(k, 0)) for k in ["easy", "medium", "hard"]}
    jur_out = {k: int(jur_counts.get(k, 0)) for k in ["US", "EU", "Other", "Mixed"]}
    ans_out = {k: int(ans_dist.get(k, 0)) for k in ["A", "B", "C", "D"]}

    return {
        "domain_counts": domain_out,
        "difficulty_counts": diff_out,
        "case_study_count": int(case_count),
        "jurisdiction_counts": jur_out,
        "correct_answer_distribution": ans_out,
    }


def validate_batch_rules(
    batch: Dict[str, Any],
    file: str,
    global_seen_ids: set,
    expect_20q_domain_mix: bool,
    strict_analytics: bool,
    strict_pattern: bool,
) -> List[ValidationIssue]:
    issues: List[ValidationIssue] = []
    qs = batch.get("questions", [])
    answer_key_seq: List[str] = []

    # Per-question checks
    for idx, q in enumerate(qs):
        qpath = f"/questions/{idx}"
        qid = q.get("id")
        if not isinstance(qid, str) or not qid.strip():
            issues.append(ValidationIssue(file, "Question id must be a non-empty string", qpath + "/id"))
        else:
            if qid in global_seen_ids:
                issues.append(ValidationIssue(file, f"Duplicate question id across files: {qid}", qpath + "/id"))
            global_seen_ids.add(qid)

        domain = q.get("domain")
        if domain not in ALLOWED_DOMAINS:
            issues.append(ValidationIssue(file, f"Invalid domain: {domain}", qpath + "/domain"))

        difficulty = q.get("difficulty")
        if difficulty not in ALLOWED_DIFFICULTY:
            issues.append(ValidationIssue(file, f"Invalid difficulty: {difficulty}", qpath + "/difficulty"))

        jurisdiction = q.get("jurisdiction")
        if jurisdiction not in ALLOWED_JURISDICTION:
            issues.append(ValidationIssue(file, f"Invalid jurisdiction: {jurisdiction}", qpath + "/jurisdiction"))

        # Options validation beyond schema
        opts = q.get("options", [])
        if not isinstance(opts, list) or len(opts) != 4:
            issues.append(ValidationIssue(file, "Options must be an array of exactly 4 items", qpath + "/options"))
            continue

        keys = [o.get("key") for o in opts if isinstance(o, dict)]
        keyset = set(keys)
        if keyset != ALLOWED_OPTION_KEYS:
            issues.append(
                ValidationIssue(
                    file,
                    f"Options must contain exactly one each of A/B/C/D. Found keys: {keys}",
                    qpath + "/options",
                )
            )

        # Option texts unique
        texts = [o.get("text") for o in opts if isinstance(o, dict)]
        if len(texts) != 4 or any((not isinstance(t, str) or not t.strip()) for t in texts):
            issues.append(ValidationIssue(file, "Each option must have non-empty text", qpath + "/options"))
        else:
            norm = [t.strip().lower() for t in texts]
            if len(set(norm)) != 4:
                issues.append(ValidationIssue(file, "Option texts must be unique within a question", qpath + "/options"))

        correct = q.get("correct_answer")
        if correct not in ALLOWED_OPTION_KEYS:
            issues.append(ValidationIssue(file, f"Invalid correct_answer: {correct}", qpath + "/correct_answer"))
        else:
            if correct not in keyset:
                issues.append(
                    ValidationIssue(file, "correct_answer must match one of the option keys", qpath + "/correct_answer")
                )
            answer_key_seq.append(correct)

    # Batch-level checks
    if expect_20q_domain_mix and len(qs) == 20:
        dc = Counter(q.get("domain") for q in qs)
        expected = {"I": 4, "II": 6, "III": 6, "IV": 4}
        if any(dc.get(k, 0) != v for k, v in expected.items()):
            issues.append(
                ValidationIssue(
                    file,
                    f"Unexpected domain mix for 20Q batch. Expected {expected}, got {dict(dc)}",
                    "/questions",
                )
            )

    # Analytics checks
    if strict_analytics:
        recomputed = recompute_analytics(batch)
        provided = batch.get("analytics", {})
        if provided != recomputed:
            issues.append(
                ValidationIssue(
                    file,
                    f"Provided analytics do not match recomputed analytics.\nProvided: {provided}\nRecomputed: {recomputed}",
                    "/analytics",
                )
            )

    # Pattern checks
    if strict_pattern and answer_key_seq:
        run = max_run(answer_key_seq)
        # This threshold is a preference; adjust if you want stricter/looser.
        if run > 4:
            issues.append(
                ValidationIssue(
                    file,
                    f"Answer key has a long same-letter run (max_run={run}). Consider rebalancing.",
                    "/questions",
                )
            )

    return issues


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--schema", required=True, help="Path to JSON schema file")
    ap.add_argument("files", nargs="+", help="JSON files or glob patterns")
    ap.add_argument(
        "--expect-20q-domain-mix",
        action="store_true",
        help="If a file has 20 questions, enforce expected domain mix I=4, II=6, III=6, IV=4",
    )
    ap.add_argument(
        "--strict-analytics",
        action="store_true",
        help="Recompute analytics and require exact match to provided analytics object",
    )
    ap.add_argument(
        "--strict-pattern",
        action="store_true",
        help="Warn/fail if answer key has a very long same-letter run (max_run > 4)",
    )

    args = ap.parse_args()

    schema = load_schema(args.schema)
    paths = resolve_files(args.files)
    if not paths:
        print("No files found to validate.", file=sys.stderr)
        return 2

    all_issues: List[ValidationIssue] = []
    global_seen_ids: set = set()

    for path in paths:
        try:
            batch = load_json(path)
        except Exception as e:
            all_issues.append(ValidationIssue(path, f"Failed to parse JSON: {e}"))
            continue

        all_issues.extend(jsonschema_validate(batch, schema, path))
        all_issues.extend(
            validate_batch_rules(
                batch=batch,
                file=path,
                global_seen_ids=global_seen_ids,
                expect_20q_domain_mix=args.expect_20q_domain_mix,
                strict_analytics=args.strict_analytics,
                strict_pattern=args.strict_pattern,
            )
        )

    if all_issues:
        print("\nVALIDATION FAILED\n")
        for issue in all_issues:
            print(str(issue))
        print(f"\nTotal issues: {len(all_issues)}")
        return 1

    print(f"VALIDATION OK — {len(paths)} file(s) checked.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
