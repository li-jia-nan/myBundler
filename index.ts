import path from 'path';
import fs, { PathLike } from 'fs';
import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import { transformFromAst } from '@babel/core';
import utils from './utils/utils';

const moduleAnalyser = (fileName: PathLike): Promise<AnalyserType> => {
  const entry = utils.completePath(fileName);
  const content = fs.readFileSync(entry, 'utf8');
  const ast = parse(content, { sourceType: 'module' });
  const dependencies: Record<PropertyKey, string> = {};
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(entry as string);
      const newFile = './' + path.join(dirname, node.source.value);
      Reflect.set(dependencies, node.source.value, newFile.replace(/\\/g, '/'));
    },
  });
  return new Promise<AnalyserType>(resolve => {
    transformFromAst(ast, null, { presets: ['@babel/preset-env'] }, (err, result) => {
      if (err) {
        resolve({ fileName, dependencies, code: '' });
      }
      resolve({ fileName, dependencies, code: result.code });
    });
  });
};

const makeDependenciesGraph = async (fileName: PathLike): Promise<GraphInfoType> => {
  const entry = utils.completePath(fileName);
  const entryModule = await moduleAnalyser(entry);
  const graphArray: AnalyserType[] = [entryModule];
  for (let i = 0; i < graphArray.length; i++) {
    const { dependencies } = graphArray[i];
    if (dependencies) {
      graphArray.push(
        ...(await Promise.all(
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

const generateCode = async (entry: PathLike): Promise<string> => {
  const path = utils.completePath(entry);
  const graph = await makeDependenciesGraph(path);
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

generateCode('./code/index.ts').then(code => {
  console.log(code);
});
