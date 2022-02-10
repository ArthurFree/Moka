import presets from './presets';

// For utils.computeProperties()
const deepOverride = (obj, opt) => {
    if (obj === undefined) {
        return opt;
    }
    const objType = Object.prototype.toString.call(obj);
    const optType = Object.prototype.toString.call(opt);
    if (objType !== optType) {
        return obj;
    }
    if (objType !== '[object Object]') {
        return opt === undefined ? obj : opt;
    }
    Object.keys({
        ...obj,
        ...opt,
    }).forEach((key) => {
        obj[key] = deepOverride(obj[key], opt[key]);
    });
    return obj;
};

const deepCopy = (obj) => {
    if (obj == null) {
        return obj;
    }
    return JSON.parse(JSON.stringify(obj));
};

// Compute presets
const computedPresets = {};
Object.keys(presets).forEach((key) => {
    let preset = deepCopy(presets[key][0]);
    if (presets[key][1]) {
        preset = deepOverride(preset, presets[key][1]);
    }
    computedPresets[key] = preset;
});

export default {
    computedPresets,
};
