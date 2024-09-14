import { createApp } from 'vue';
import App from './App.vue'
import { createPinia } from 'pinia';
import './assets/main.css';
import "./flags.css";
import '@fortawesome/fontawesome-free/css/all.css';
import { useAuthStore } from './stores/authStore';




const app = createApp(App)
const pinia = createPinia();

import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';

import router from './router'

import Noir from './presets/Noir.js';
import ThemeSwitcher from './components/ThemeSwitcher.vue';
import AppState from './plugins/appState.js';

import ToastService from 'primevue/toastservice';
import Card from 'primevue/card';
import DialogService from 'primevue/dialogservice';
import ConfirmationService from 'primevue/confirmationservice';
import Toast from 'primevue/toast';

import Menu from 'primevue/menu';
import MultiSelect from 'primevue/multiselect';


export const PrimeVitals = {
  install: (app) => {
    app.use(ConfirmationService);
    app.use(ToastService);
    app.use(DialogService);
    app.component('Toast', Toast);
    app.component('Card', Card);
  },
};


app.use(PrimeVitals);
app.directive('ripple', Ripple);
app.use(router);


app.use(PrimeVue, {
    theme: {
        preset: Noir,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            },
            prefix: 'p',
            darkModeSelector: '.p-dark',
            cssLayer: false

        }
    }
    
 }, 
 {Ripple: true}
);
app.use(AppState);
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';                   // optional
import Aura from '@primevue/themes/aura';
import Dialog from 'primevue/dialog';
import Editor from 'primevue/editor';
import Paginator from 'primevue/paginator';
import PanelMenu from 'primevue/panelmenu';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';   //Optional for grouping
import Menubar from 'primevue/menubar';
import MegaMenu from 'primevue/megamenu';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Password from 'primevue/password';
import Divider from 'primevue/divider';
import TreeTable from 'primevue/treetable';
import Select from 'primevue/select';
import Chart from 'primevue/chart';
import OrganizationChart from 'primevue/organizationchart';
import Ripple from 'primevue/ripple';
import Toolbar from 'primevue/toolbar';
import DatePicker from 'primevue/datepicker';
import Image from 'primevue/image';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Fieldset from 'primevue/fieldset';
import Breadcrumb from 'primevue/breadcrumb';

import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Message from 'primevue/message';
import DynamicDialog from 'primevue/dynamicdialog';
import DataView from 'primevue/dataview';
import SelectButton from 'primevue/selectbutton';
import ProgressBar from 'primevue/progressbar';
import ScrollPanel from 'primevue/scrollpanel';
// import as component
import Badge from 'primevue/badge';
import OverlayBadge from 'primevue/overlaybadge';
import Tooltip from 'primevue/tooltip';
import Drawer from 'primevue/drawer';



app.component('Button', Button);
app.component('DataTable',DataTable);
app.component('Column',Column);
app.component('ColumnGroup',ColumnGroup);
app.component('Row',Row);
app.component('Dialog',Dialog);
app.component('Editor', Editor);
app.component('Paginator',Paginator);
app.component('Panelmenu', PanelMenu);
app.component('Avatar', Avatar);
app.component('AvatarGroup', AvatarGroup);
app.component('Menubar',Menubar);
app.component('MegaMenu',MegaMenu);
app.component('IconField',IconField);
app.component('InputIcon',InputIcon);
app.component('Menu', Menu);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Textarea ', Textarea );
app.component('FileUpload', FileUpload);
app.component('Password',Password);
app.component('Divider', Divider);
app.component('TreeTable', TreeTable);
app.component('Select', Select);
app.component('Chart',Chart);
app.component('OrganizationChart', OrganizationChart);
app.directive('ripple', Ripple);
app.component('ThemeSwitcher', ThemeSwitcher);
app.component('Toolbar', Toolbar);
app.component('DatePicker',DatePicker);
app.component('Image', Image);
app.component('Tag', Tag);

app.component('ProgressSpinner', ProgressSpinner);
app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('AccordionHeader',AccordionHeader);
app.component('AccordionContent',AccordionContent);
app.component('Fieldset',Fieldset);
app.component('Breadcrumb',Breadcrumb);

app.component('Tabs', Tabs);
app.component('TabList', TabList);
app.component('Tab', Tab);
app.component('TabPanels', TabPanels);
app.component('TabPanel', TabPanel);
app.component('Message', Message);
app.component('DynamicDialog',DynamicDialog);
app.component('DataView',DataView);
app.component('SelectButton',SelectButton);
app.component('ProgressBar',ProgressBar);
app.component('ScrollPanel',ScrollPanel);
app.component('MultiSelect', MultiSelect);
app.component('Drawer', Drawer);

app.component('Badge', Badge);
app.component('OverlayBadge', OverlayBadge);

app.component('Editor', Editor);
app.directive('tooltip', Tooltip);

app.use(pinia);
const authStore = useAuthStore();
authStore.loadUser(); // Cargar el usuario y token desde localStorage
app.mount('#app');
