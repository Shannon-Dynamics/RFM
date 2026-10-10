use ch14_post_training::exercises::*;
use ch14_post_training::*;

#[test]
fn ex14_1_lora_trains_a_sliver_of_the_model() {
    let (full, lora) = trainable(&[Matrix { d_in: 10, d_out: 20 }], 2);
    assert_eq!((full, lora), (200, 60));
    let (full, lora) = trainable(&backbone(), 16);
    assert!(full > 2_000_000_000 && full < 2_300_000_000, "{full}");
    assert!((lora as f64) < 0.011 * full as f64, "rank 16 trains about 1 percent");
    let (_, l8) = trainable(&backbone(), 8);
    assert_eq!(l8 * 2, lora, "LoRA cost is linear in the rank");
}

#[test]
fn ex14_2_reward_moves_the_aim_and_the_anchor_holds_it_back() {
    let free = refine(30, 16, 0.15, 0.3, 0.0);
    assert_eq!(free.len(), 31);
    assert_eq!(free[0], BASE);
    assert!((free[30] - BEST).abs() < 0.01, "unanchored refinement finds the best setting: {}", free[30]);
    let held = refine(30, 16, 0.15, 0.3, 0.1);
    let tight = refine(30, 16, 0.15, 0.3, 0.3);
    assert!(held[30] < free[30] - 0.05 && tight[30] < held[30]);
    // Without exploration there is nothing to learn from.
    assert!(refine(30, 16, 0.0, 0.3, 0.0).iter().all(|m| m.abs() < 1e-12));
}

#[test]
fn ex14_3_short_memory_forgets_what_long_memory_keeps() {
    let ev = grilled_cheese();
    let (short, long) = recall(&ev, 500.0, 30.0);
    assert_eq!(short, vec!["sandwich flipped"]);
    assert_eq!(long.len(), 6);
    assert!(long.contains(&"stove turned on"));
    // Whether the stove is on matters at the end, ten minutes after it happened.
    let (short, long) = recall(&ev, 800.0, 30.0);
    assert!(!short.contains(&"stove turned on") && long.contains(&"stove turned on"));
    let (short, long) = recall(&ev, 10.0, 30.0);
    assert!(short.is_empty() && long.is_empty());
}
