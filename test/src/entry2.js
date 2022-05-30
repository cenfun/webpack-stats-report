const context = require.context('./components', true, /\.js$/);
const paths = context.keys();

const components = {};
paths.forEach((path, i) => {
    components[`component${i}`] = context(path).default;
});

export default components;
