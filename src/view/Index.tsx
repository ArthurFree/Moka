import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import loadable from '@loadable/component';
import Layout from './Layout/index';
import Editor from './Editor/index';
// import Material from './Material';
import './index.scss';

const LoadEditor = loadable(() => import('./Editor/index'));
const LoadMaterial = loadable(() => import('./Material/index'));
const LoadTestPage = loadable(() => import('./TestPage/index'));

const App = (): React.ReactElement => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route path="/edit" element={<Editor />} />
            </Route>
            <Route path="/editor" element={<LoadEditor />} />
            <Route path="/material" element={<LoadMaterial />} />
            <Route path="/test" element={<LoadTestPage />} />
        </Routes>
    </BrowserRouter>
);

export default App;
