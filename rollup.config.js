import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'
import typescript from 'rollup-plugin-typescript2'
import dotenv from 'dotenv'

import pkg from './package.json'

// Load vars from .env into process.env
dotenv.config()

/**
 * NOTES: injecting mediapipe
 *
 * Currently, @mediapipe/face_mesh is included as a peer dependency, so it (as well as the other
 * peer deps) should/will be dynamically imported by projects that use this module. face_mesh depends
 * on "path" and "process" from node - some modern esm client frameworks (WebPack 5, Rollup...) don't
 * include those by default, so projects will need to set that up themselves. See docs here:
 *
 *
 * It might be beneficial at some point to inject the face_mesh JS code into our bundle (e.g. include
 * it "statically") as well as the path/process code it needs to run. This would decrease configuration
 * for some customers and (possibly?) keep mediapipe more stable since we would control the JS for it.
 * We put that down for now in the interest of time.
 *
 * To do that:
 * 1) Remove "@mediapipe/face_mesh" from peerDependencies in package.json
 *
 * After building, you should see the face_mesh code injected into dist/index.js. However there is
 * currently an issue - something in nodeResolve/commonjs renames the last line from .call(this) to
 * .call(commonjsGlobal), when it should be .call(face_mesh). If you change this by hand, in the dist
 * folder it will start working in the demo.
 *
 * We could use rollup-replace to fix that, but it feels hacky. I feel like there must be a better way.
 */

let external = ['dns', 'fsx', 'url']

external = external.concat(Object.keys(pkg.peerDependencies || {}))

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs'
    },
    {
      file: pkg.module,
      format: 'es'
    }
  ],
  external,
  plugins: [
    typescript({
      typescript: require('typescript')
    }),
    commonjs({
      include: /\/node_modules\//,
      extensions: ['.js', 'js']
    }),
    nodeResolve({
      browser: true
    }),
    globals(),
    builtins()
  ]
}
