export type Challenge = {
  formula: string;
  validate: (inputs: number[]) => boolean;
};
