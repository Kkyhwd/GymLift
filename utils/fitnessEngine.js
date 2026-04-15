// utils/fitnessEngine.js

/**
 * GYMLIFT CORE UTILITY ENGINE
 * Logic for 1RM, Plate Math, and Volume Tracking
 */

export const FitnessEngine = {
  /**
   * Calculate One-Rep Max using the Epley Formula
   * Formula: 1RM = W * (1 + r / 30)
   */
  calculate1RM: (weight, reps) => {
    if (reps === 1) return weight;
    if (reps === 0) return 0;
    return Math.round(weight * (1 + reps / 30));
  },

  /**
   * Plate Calculator (Standard 45lb/20kg barbell)
   * Returns an array of plates needed for ONE side of the bar.
   */
  getPlateStack: (targetWeight, isMetric = false) => {
    const barWeight = isMetric ? 20 : 45;
    const availablePlates = isMetric
      ? [25, 20, 15, 10, 5, 2.5, 1.25]
      : [45, 35, 25, 10, 5, 2.5];

    let remainingWeight = (targetWeight - barWeight) / 2;
    const stack = [];

    if (remainingWeight < 0) return [];

    availablePlates.forEach((plate) => {
      while (remainingWeight >= plate) {
        stack.push(plate);
        remainingWeight -= plate;
      }
    });

    return stack;
  },

  /**
   * Calculate Total Volume for a set
   */
  calculateVolume: (weight, reps, sets = 1) => {
    return weight * reps * sets;
  },

  /**
   * Strength Score (Simple ratio of 1RM to Bodyweight)
   */
  getStrengthRatio: (oneRepMax, bodyWeight) => {
    if (!bodyWeight) return 0;
    return (oneRepMax / bodyWeight).toFixed(2);
  },
};
