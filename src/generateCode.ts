import { PathLike } from 'fs';
import utils from '../utils/utils';
import makeDependenciesGraph from './makeDependenciesGraph';

const generateCode = (entry: PathLike): string => {
  const path = utils.completePath(entry);
  const graph = makeDependenciesGraph(path);
  return `
    (graph => {
      const require = module => {
        const localRequire = relativePath => require(graph[module].dependencies[relativePath]);
        const exports = {};
        ((require, exports, code) => {
          eval(code);
        })(localRequire, exports, graph[module].code);
        return exports;
      };
      require('${entry}');
    })(${JSON.stringify(graph)});
  `;
};

export default generateCode;
