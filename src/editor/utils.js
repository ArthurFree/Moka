import moka from './core';

moka.Utils.createEventHooks = (object) => {
    const listenerMap = Object.create(null);

    object.$trigger = (eventType, ...args) => {
        const listeners = listenerMap[eventType];
        if (listeners) {
            listeners.forEach((listener) => {
                try {
                    listener.apply(object, args);
                } catch (e) {
                    console.log('--- trigger error ---', e.message, e.stack);
                }
            });
        }
    };

    object.on = (eventType, listener) => {
        let listeners = listenerMap[eventType];

        if (!listeners) {
            listeners = [];
            listenerMap[eventType] = listeners;
        }

        listeners.push(listener);
    };

    object.off = (eventType, listener) => {
        const listeners = listenerMap[eventType];

        if (listeners) {
            const index = listeners.indexOf(listener);

            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    };
};
