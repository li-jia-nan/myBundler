declare interface AnalyserType {
  fileName: fs.PathLike;
  dependencies: Record<PropertyKey, string>;
  code: string;
}

declare interface GraphInfoType {
  [fileName: string]: {
    code: AnalyserType['code'];
    dependencies: AnalyserType['dependencies'];
  };
}
