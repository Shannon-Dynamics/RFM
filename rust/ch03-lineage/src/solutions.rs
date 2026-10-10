//! Reference solutions for the Chapter 3 exercises (compiled with `--features solutions`).

use crate::*;

pub fn ancestors(lineage: &Lineage, name: &str) -> Vec<&'static str> {
    let mut found: Vec<&'static str> = Vec::new();
    let mut frontier = vec![name.to_string()];
    while let Some(n) = frontier.pop() {
        for e in lineage.edges.iter().filter(|e| e.to == n) {
            if !found.contains(&e.from) {
                found.push(e.from);
                frontier.push(e.from.to_string());
            }
        }
    }
    found.sort_unstable();
    found
}

pub fn inconsistent_edges(lineage: &Lineage) -> Vec<&Edge> {
    lineage
        .edges
        .iter()
        .filter(|e| match (lineage.model(e.from), lineage.model(e.to)) {
            (Some(a), Some(b)) => b.released < a.released,
            _ => true,
        })
        .collect()
}

pub fn longest_successor_chain(lineage: &Lineage) -> usize {
    fn depth(l: &Lineage, n: &str) -> usize {
        1 + l.edges.iter().filter(|e| e.from == n && e.link == Link::Successor).map(|e| depth(l, e.to)).max().unwrap_or(0)
    }
    lineage.models.iter().map(|m| depth(lineage, m.name)).max().unwrap_or(0)
}
