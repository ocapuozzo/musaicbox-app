import {Orbit} from "./Orbit";

export interface ISortedOrbits {
  groupingCriterion: string;
  hashcode: number;
  orbits: Orbit[];
}

