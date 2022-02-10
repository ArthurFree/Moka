let arrayProperties = {};
let objectProperties = {};

arrayProperties.m_each = (cb) => {
    let i = 0;
    const { length } = this;

    for (; i < length; i++) {
        cb(this[i], i, this);
    }
};

arrayProperties.m_some = (cb) => {
    let i = 0;
    let { length } = this;

    for (; i < length; i++) {
        if (cb(this[i], i, this)) {
            return true;
        }
    }
};

arrayProperties.m_map = (cb) => {
    let i = 0;
    const { length } = this;
    const result = Array(length);

    for (; i < length; i++) {
        result[i] = cb(this[i], i, this);
    }

    return result;
}

objectProperties.m_each = function (cb) {
    let i = 0;
    const keys = Object.keys(this);
    const { length } = keys;

    for (; i < length; i++) {
        cb(this[keys[i]], keys[i], this)
    }
}

objectProperties.m_reduce = function (cb, memo) {
    let i = 0;
    const keys = Object.keys(this);
    const { length } = keys;

    for (; i < length; i++) {
        memo = cb(memo, this[keys[i]], keys[i], this)
    }

    return memo;
}


function build(properties) {
    return objectProperties.m_reduce.call(properties, (memo, value, key) => {
        memo[key] = {
            value: value,
            configurable: true,
        }

        return memo;
    }, {});
}

arrayProperties = build(arrayProperties);
objectProperties = build(objectProperties);

Object.defineProperties(Array.prototype, arrayProperties);
Object.defineProperties(Int8Array.prototype, arrayProperties);
Object.defineProperties(Uint8Array.prototype, arrayProperties);
Object.defineProperties(Uint8ClampedArray.prototype, arrayProperties);
Object.defineProperties(Int16Array.prototype, arrayProperties);
Object.defineProperties(Uint16Array.prototype, arrayProperties);
Object.defineProperties(Int32Array.prototype, arrayProperties);
Object.defineProperties(Uint32Array.prototype, arrayProperties);
Object.defineProperties(Float32Array.prototype, arrayProperties);
Object.defineProperties(Float64Array.prototype, arrayProperties);
Object.defineProperties(Object.prototype, objectProperties);

if (typeof window !== 'undefined') {
    // Object.defineProperties(HTMLCollection.prototype, liveCollectionProperties)
    // Object.defineProperties(NodeList.prototype, liveCollectionProperties)
}
