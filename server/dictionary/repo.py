from __future__ import annotations

from typing import Any


def _fetch_all(cursor) -> list[dict[str, Any]]:
    rows = cursor.fetchall()
    return [dict(row) for row in rows]


def _fetch_one(cursor) -> dict[str, Any] | None:
    row = cursor.fetchone()
    return dict(row) if row else None


def list_lexicons(conn) -> list[dict[str, Any]]:
    sql = """
    SELECT
      l.lexicon_id,
      l.lexicon_key,
      l.display_name,
      l.description,
      l.is_native,
      l.sort_order,
      COUNT(DISTINCT t.term_id) AS term_count,
      COUNT(DISTINCT t.concept_id) AS concept_count
    FROM lexicon l
    LEFT JOIN dictionary_term t
      ON t.lexicon_id = l.lexicon_id
    GROUP BY
      l.lexicon_id, l.lexicon_key, l.display_name,
      l.description, l.is_native, l.sort_order
    ORDER BY l.sort_order, l.lexicon_key
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql)
    return _fetch_all(cur)


def get_concept_by_key(conn, concept_key: str) -> dict[str, Any] | None:
    sql = """
    SELECT
      concept_id,
      concept_key,
      native_term,
      native_definition,
      notes,
      parent_concept_id,
      status,
      sort_order,
      created_at,
      updated_at
    FROM dictionary_concept
    WHERE concept_key = %s
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key,))
    return _fetch_one(cur)


def get_terms_for_concept(conn, concept_key: str) -> list[dict[str, Any]]:
    sql = """
    SELECT
      vt.concept_id,
      vt.concept_key,
      vt.native_term,
      vt.lexicon_key,
      vt.lexicon_name,
      vt.term_label,
      vt.short_definition,
      vt.extended_definition,
      vt.analogy_strength,
      vt.preferred_flag,
      vt.concept_sort_order,
      vt.lexicon_sort_order
    FROM v_dictionary_terms vt
    WHERE vt.concept_key = %s
    ORDER BY vt.lexicon_sort_order, vt.preferred_flag DESC, vt.term_label
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key,))
    return _fetch_all(cur)


def get_aliases_for_concept(conn, concept_key: str) -> list[dict[str, Any]]:
    sql = """
    SELECT
      va.alias_id,
      va.concept_key,
      va.native_term,
      va.lexicon_key,
      va.lexicon_name,
      va.alias_label,
      va.alias_type,
      va.notes,
      va.sort_order
    FROM v_dictionary_aliases va
    WHERE va.concept_key = %s
    ORDER BY
      CASE WHEN va.lexicon_key IS NULL THEN 0 ELSE 1 END,
      va.lexicon_name,
      va.sort_order,
      va.alias_label
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key,))
    return _fetch_all(cur)


def get_examples_for_concept(conn, concept_key: str) -> list[dict[str, Any]]:
    sql = """
    SELECT
      e.example_id,
      c.concept_key,
      c.native_term,
      l.lexicon_key,
      l.display_name AS lexicon_name,
      e.title,
      e.example_text,
      e.sort_order,
      e.created_at,
      e.updated_at
    FROM dictionary_example e
    JOIN dictionary_concept c
      ON c.concept_id = e.concept_id
    LEFT JOIN lexicon l
      ON l.lexicon_id = e.lexicon_id
    WHERE c.concept_key = %s
    ORDER BY
      CASE WHEN l.lexicon_id IS NULL THEN 0 ELSE 1 END,
      l.sort_order,
      e.sort_order,
      e.example_id
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key,))
    return _fetch_all(cur)


def get_relations_for_concept(conn, concept_key: str) -> list[dict[str, Any]]:
    sql = """
    SELECT
      r.relation_id,
      r.relation_key,
      sc.concept_key AS subject_key,
      sc.native_term AS subject_native_term,
      oc.concept_key AS object_key,
      oc.native_term AS object_native_term,
      r.notes,
      r.sort_order,
      r.created_at
    FROM dictionary_relation r
    JOIN dictionary_concept sc
      ON sc.concept_id = r.subject_concept_id
    JOIN dictionary_concept oc
      ON oc.concept_id = r.object_concept_id
    WHERE sc.concept_key = %s
       OR oc.concept_key = %s
    ORDER BY r.sort_order, r.relation_id
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key, concept_key))
    return _fetch_all(cur)


def search_terms(conn, q: str, limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    like_q = f"%{q}%"

    sql = """
    SELECT
      concept_key,
      native_term,
      lexicon_key,
      lexicon_name,
      term_id,
      term_label,
      short_definition,
      extended_definition,
      analogy_strength,
      preferred_flag,
      MIN(match_rank) AS match_rank
    FROM (
      SELECT
        c.concept_key,
        c.native_term,
        l.lexicon_key,
        l.display_name AS lexicon_name,
        t.term_id,
        t.term_label,
        t.short_definition,
        t.extended_definition,
        t.analogy_strength,
        t.preferred_flag,
        0 AS match_rank
      FROM dictionary_term t
      JOIN dictionary_concept c
        ON c.concept_id = t.concept_id
      JOIN lexicon l
        ON l.lexicon_id = t.lexicon_id
      WHERE t.term_label LIKE %s
         OR c.concept_key LIKE %s
         OR c.native_term LIKE %s

      UNION ALL

      SELECT
        c.concept_key,
        c.native_term,
        l.lexicon_key,
        l.display_name AS lexicon_name,
        t.term_id,
        t.term_label,
        t.short_definition,
        t.extended_definition,
        t.analogy_strength,
        t.preferred_flag,
        1 AS match_rank
      FROM dictionary_alias a
      JOIN dictionary_concept c
        ON c.concept_id = a.concept_id
      JOIN dictionary_term t
        ON t.concept_id = c.concept_id
       AND (a.lexicon_id = t.lexicon_id OR a.lexicon_id IS NULL)
      JOIN lexicon l
        ON l.lexicon_id = t.lexicon_id
      WHERE a.alias_label LIKE %s
    ) AS matches
    GROUP BY
      concept_key,
      native_term,
      lexicon_key,
      lexicon_name,
      term_id,
      term_label,
      short_definition,
      extended_definition,
      analogy_strength,
      preferred_flag
    ORDER BY
      MIN(match_rank),
      preferred_flag DESC,
      lexicon_name,
      term_label
    LIMIT %s OFFSET %s
    """

    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (like_q, like_q, like_q, like_q, limit, offset))
    return _fetch_all(cur)


def translate_concept(conn, concept_key: str) -> list[dict[str, Any]]:
    sql = """
    SELECT
      c.concept_key,
      c.native_term,
      c.native_definition,
      l.lexicon_key,
      l.display_name AS lexicon_name,
      t.term_label,
      t.short_definition,
      t.extended_definition,
      t.analogy_strength,
      t.preferred_flag
    FROM dictionary_concept c
    LEFT JOIN dictionary_term t
      ON t.concept_id = c.concept_id
    LEFT JOIN lexicon l
      ON l.lexicon_id = t.lexicon_id
    WHERE c.concept_key = %s
    ORDER BY l.sort_order, t.preferred_flag DESC, t.term_label
    """
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (concept_key,))
    return _fetch_all(cur)
