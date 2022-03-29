import { Node } from 'prosemirror-model';
import { findParentNode, findChildren } from 'prosemirror-utils';

type getNodeFn = (node: Node) => boolean;

const getParentNode = (state, fn: getNodeFn) => {
    return findParentNode(fn)(state.selection);
};

/**
 * 是否仅次于 doc 层级的节点
 * @param state
 * @returns
 */
export const isTopLevel = (state) => state.selection.$from.depth === 1;

/**
 * 根据 Node.type.name 获取节点
 * @param state ProseMirror State
 * @param typeName string
 * @returns
 */
export const getParentNodeByTypeName = (state, typeName) => {
    return getParentNode(state, (node) => node.type.name === typeName);
};

/**
 * 根据 attr 获取目标节点
 * @param state
 * @param attrName attr 名称
 * @param attrValue attr 预期的值
 * @returns
 */
export const getParentNodeByAttrs = (state, attrName: string, attrValue) => {
    return getParentNode(state, (node) => node.attrs[attrName] === attrValue);
};

/**
 * 判断 Node 中的内容是否为空
 * @param parent
 * @returns
 */
export const isEmpty = (parent) => {
    if (parent && parent.node.content.size === 0) {
        return true;
    }

    return false;
};

/**
 * 获取所有匹配的类型
 * @param state
 * @param types
 * @returns
 */
export const getTotalParentNode = (state, types) => {
    const obj: { [key: string]: any } = {};
    types.forEach((type) => {
        if (type === 'taskItem') {
            obj[`${type}Parent`] = getParentNodeByAttrs(state, 'task', true);
        } else {
            obj[`${type}Parent`] = getParentNodeByTypeName(state, type);
        }
    });

    return obj;
};

/**
 * 判断是否所有的类型都没有匹配上
 * @param types
 * @param nodes
 * @returns
 */
export const hasAllNodeNoExist = (types, nodes) => {
    return types.every((type) => !nodes[`${type}Parent`]);
};
