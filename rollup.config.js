

const resolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const cleanup = require('rollup-plugin-cleanup');
const { NODE_ENV } = process.env;

const onwarn = (warning, warn) => {
    // Suppress non-actionable warning caused by TypeScript boilerplate:
    if (warning.code !== 'THIS_IS_UNDEFINED') {
        warn(warning);
    }
};

const plugins = [resolve(), replace({ 'Reflect.decorate': 'undefined' })];
const watchFiles = ['lib/**', '../3dom/lib/**'];

const outputOptions = [{
    input: './lib/module.js',
    output: {
        file: './dist/module.js',
        sourcemap: true,
        format: 'esm',
        name: 'ModuleElement'
    },
    watch: {
        include: watchFiles,
    },
    plugins,
    onwarn,
}];

if (NODE_ENV !== 'development') {
    plugins.unshift(cleanup({
        // Ideally we'd also clean third_party/three, which saves
        // ~45kb in filesize alone... but takes 2 minutes to build
        include: ['lib/**'],
        comments: 'none',
    }));

    outputOptions.push(
        {
            input: './lib/module.js',
            output: {
                file: './dist/module-umd.js',
                sourcemap: true,
                format: 'umd',
                name: 'ModuleElement'
            },
            watch: {
                include: watchFiles,
            },
            plugins,
            onwarn,
        },
    );
}

export default outputOptions;
