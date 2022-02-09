const arrProperties = {};
const objectProperties = {};

arrProperties.m_each = (cb) => {
    let i = 0;
    const { length } = this;

    for (; i < length; i++) {
        cb(this[i], i, this);
    }
};

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
