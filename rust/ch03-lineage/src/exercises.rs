//! Chapter 3 exercises. Replace each `todo!()`, then run `cargo test -p ch03-lineage --test exercises`.
#![allow(unused_variables)]

use crate::*;

/// Exercise 3.1: where did it come from?
/// Every model `name` descends from, through any chain of edges, sorted alphabetically.
pub fn ancestors(lineage: &Lineage, name: &str) -> Vec<&'static str> {
    todo!("Exercise 3.1")
}

/// Exercise 3.2: nothing descends from the future.
/// Return every edge whose `to` model was released before its `from` model, or that names a
/// model missing from the list. An empty result means the lineage is consistent.
pub fn inconsistent_edges(lineage: &Lineage) -> Vec<&Edge> {
    todo!("Exercise 3.2")
}

/// Exercise 3.3: the longest family line.
/// Length, in models, of the longest chain that follows `Successor` edges only.
pub fn longest_successor_chain(lineage: &Lineage) -> usize {
    todo!("Exercise 3.3")
}
