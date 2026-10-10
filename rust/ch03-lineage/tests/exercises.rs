use ch03_lineage::exercises::*;
use ch03_lineage::*;

#[test]
fn ex3_1_ancestors_follow_every_kind_of_edge() {
    let l = book_lineage();
    assert_eq!(ancestors(&l, "pi-0.7"), vec!["ACT", "Diffusion Policy", "pi*0.6", "pi-0", "pi-0.5"]);
    assert_eq!(ancestors(&l, "GR00T N2 (preview)"), vec!["DreamZero", "Dreamer", "DreamerV3", "GR00T N1", "PlaNet", "Wan"]);
    assert!(ancestors(&l, "RT-1").is_empty());
}

#[test]
fn ex3_2_the_book_lineage_is_consistent_and_a_bad_edge_is_caught() {
    let mut l = book_lineage();
    assert!(inconsistent_edges(&l).is_empty());
    l.edges.push(Edge { from: "pi-0.7", to: "RT-1", link: Link::BuildsOn });
    l.edges.push(Edge { from: "RT-2", to: "Nonexistent", link: Link::Successor });
    let bad = inconsistent_edges(&l);
    assert_eq!(bad.len(), 2);
}

#[test]
fn ex3_3_the_pi_line_is_the_longest() {
    // pi-0 -> pi-0.5 -> pi*0.6 -> pi-0.7
    assert_eq!(longest_successor_chain(&book_lineage()), 4);
}
