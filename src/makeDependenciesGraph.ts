import { PathLike } from 'fs';
import utils from '../utils/utils';
import moduleAnalyser from './moduleAnalyser';

const makeDependenciesGraph = async (fileName: PathLike): Promise<GraphInfoType> => {
  const entry = utils.completePath(fileName);
  const entryModule = await moduleAnalyser(entry);
  const graphArray: AnalyserType[] = [entryModule];
  for (let i = 0; i < graphArray.length; i++) {
    const { dependencies } = graphArray[i];
    if (dependencies) {
      graphArray.push(
        ...(await Promise.all<AnalyserType>(
          Object.keys(dependencies).map(key => moduleAnalyser(Reflect.get(dependencies, key)))
        ))
      );
    }
  }
  const graph: GraphInfoType = {};
  graphArray.forEach(item => {
    const { fileName, dependencies, code } = item;
    Reflect.set(graph, fileName as string, { dependencies, code });
  });
  return graph;
};

export default makeDependenciesGraph;
