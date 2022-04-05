interface AnalyserType {
  fileName: fs.PathLike;
  dependencies: Record<PropertyKey, string>;
  code: string;
}

interface GraphInfoType {
  [fileName: string]: {
    code: AnalyserType['code'];
    dependencies: AnalyserType['dependencies'];
  };
}
