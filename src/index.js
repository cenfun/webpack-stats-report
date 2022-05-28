import App from './app.vue';
const app = App.createComponent();

app.config.errorHandler = (err, instance, info) => {
    console.log(err, instance, info);
};
