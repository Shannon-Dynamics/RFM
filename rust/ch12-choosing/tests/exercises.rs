use ch12_choosing::exercises::*;
use ch12_choosing::*;

const EQUAL: [f64; 8] = [1.0; 8];

#[test]
fn ex12_1_weighted_scores_stay_on_the_matrix_scale() {
    for f in ALL {
        let s = weighted_score(f, &EQUAL);
        assert!((1.0..=3.0).contains(&s), "{f:?} {s}");
    }
    // Equal weights reward the most mature, best-documented family.
    assert_eq!(best(&EQUAL), Family::ReactiveVla);
    // Care only about reasoning about consequences: a tie between three families goes to the first listed.
    let mut w = [0.0; 8];
    w[3] = 1.0;
    assert_eq!(best(&w), Family::WorldAction);
    // Care only about cheap inference.
    let mut w = [0.0; 8];
    w[0] = 1.0;
    assert_eq!(best(&w), Family::LargeBehavior);
    assert_eq!(weighted_score(Family::Latent, &[0.0; 8]), 0.0);
}

#[test]
fn ex12_2_every_family_wins_on_something() {
    let book: Vec<_> = ALL.iter().map(|f| (*f, scores(*f))).collect();
    // That is why there are seven families: none is dominated in the book's matrix.
    assert!(dominated(&book).is_empty());
    // Make geometry-first models slower and weaker at consequences: WAMs now beat them everywhere.
    let mut worse = book.clone();
    worse[4].1 = [1, 1, 1, 2, 2, 1, 1, 1];
    assert_eq!(dominated(&worse), vec![Family::Geometry]);
    // Identical rows do not dominate each other.
    let twins = vec![(Family::Latent, [2; 8]), (Family::Simulator, [2; 8])];
    assert!(dominated(&twins).is_empty());
}

#[test]
fn ex12_3_a_small_change_of_weight_changes_the_answer() {
    // Raising the weight on consequences from 1 to about 2 hands the win to world-action models.
    let d = flip(&EQUAL, 3).expect("consequences can flip the ranking");
    assert!(d > 0.0 && d <= 1.5, "{d}");
    let mut w = EQUAL;
    w[3] += d;
    assert_ne!(best(&w), Family::ReactiveVla);
    // Weighting maturity even more cannot dethrone the leader.
    assert_eq!(flip(&EQUAL, 5), None);
}
