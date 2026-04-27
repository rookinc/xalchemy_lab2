from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from server.db import get_db_connection
from server.dictionary import repo

router = APIRouter(tags=["dictionary"])


def ok(data):
    return {"ok": True, "data": data}


def ok_list(items):
    return {"ok": True, "items": items, "count": len(items)}


@router.get("/lexicons")
def list_lexicons():
    conn = get_db_connection()
    try:
        items = repo.list_lexicons(conn)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/concepts/{concept_key}")
def get_concept(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        return ok(concept)
    finally:
        conn.close()


@router.get("/concepts/{concept_key}/terms")
def get_concept_terms(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        items = repo.get_terms_for_concept(conn, concept_key)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/concepts/{concept_key}/aliases")
def get_concept_aliases(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        items = repo.get_aliases_for_concept(conn, concept_key)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/concepts/{concept_key}/examples")
def get_concept_examples(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        items = repo.get_examples_for_concept(conn, concept_key)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/concepts/{concept_key}/relations")
def get_concept_relations(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        items = repo.get_relations_for_concept(conn, concept_key)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/term-search")
def term_search(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    conn = get_db_connection()
    try:
        items = repo.search_terms(conn, q=q, limit=limit, offset=offset)
        return ok_list(items)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"term_search failed: {exc}")
    finally:
        conn.close()


@router.get("/translate/concept/{concept_key}")
def translate_concept(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")
        items = repo.translate_concept(conn, concept_key)
        return ok_list(items)
    finally:
        conn.close()


@router.get("/concept-page/{concept_key}")
def get_concept_page(concept_key: str):
    conn = get_db_connection()
    try:
        concept = repo.get_concept_by_key(conn, concept_key)
        if not concept:
            raise HTTPException(status_code=404, detail="Concept not found")

        terms = repo.get_terms_for_concept(conn, concept_key)
        aliases = repo.get_aliases_for_concept(conn, concept_key)
        examples = repo.get_examples_for_concept(conn, concept_key)
        relations = repo.get_relations_for_concept(conn, concept_key)

        return {
            "ok": True,
            "data": {
                "concept": concept,
                "terms": terms,
                "aliases": aliases,
                "examples": examples,
                "relations": relations,
            },
        }
    finally:
        conn.close()
