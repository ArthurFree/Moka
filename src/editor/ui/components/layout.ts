import { EditorType, PreviewStyle } from '@editorType/editor';
import { Emitter } from '@editorType/event';
import { IndexList, ToolbarItem, ToolbarItemOptions } from '@editorType/ui';
import { cls } from '@/utils/dom';
import html from '../vdom/template';
import { Component } from '../vdom/component';
import { Switch } from './switch';
import { Toolbar } from './toolbar/toolbar';
import { ContextMenu } from './contextMenu';

interface Props {
    eventEmitter: Emitter;
    hideModeSwitch: boolean;
    hideToolbar: boolean;
    slots: {
        mdEditor: HTMLElement;
        mdPreview: HTMLElement;
        wwEditor: HTMLElement;
    };
    previewStyle: PreviewStyle;
    editorType: EditorType;
    toolbarItems: ToolbarItem[];
    theme: string;
}

interface State {
    editorType: EditorType;
    previewStyle: PreviewStyle;
    hide: boolean;
    hideToolbar: boolean;
}

export class Layout extends Component<Props, State> {
    private toolbar!: Toolbar;

    constructor(props: Props) {
        super(props);
        const { editorType, previewStyle, hideToolbar } = props;

        this.state = {
            editorType,
            previewStyle,
            hideToolbar,
            hide: false
        };
        this.addEvent();
    }

    mounted() {
        const { hideToolbar } = this.state;
        const { eventEmitter, slots } = this.props;
        const { wwEditor, mdEditor, mdPreview } = slots;

        this.refs.wwContainer.appendChild(wwEditor);
        this.refs.mdContainer.insertAdjacentElement('afterbegin', mdEditor);
        this.refs.mdContainer.appendChild(mdPreview);

        eventEmitter.listen('hideToolbar', (isHide: boolean) => {
            this.setState({
                hideToolbar: isHide
            });
        });
    }

    insertToolbarItem(indexList: IndexList, item: string | ToolbarItemOptions) {
        this.toolbar.insertToolbarItem(indexList, item);
    }

    removeToolbarItem(name: string) {
        this.toolbar.removeToolbarItem(name);
    }

    render() {
        const { eventEmitter, hideModeSwitch, toolbarItems, theme } = this.props;
        const { hide, previewStyle, editorType, hideToolbar } = this.state;
        const displayClassName = hide ? ' hidden' : '';
        const editorTypeClassName = cls(editorType === 'markdown' ? 'md-mode' : 'ww-mode');
        const previewClassName = `${cls('md')}-${previewStyle}-style`;
        const themeClassName = cls([theme !== 'light', `${theme} `]);

        return html`
            <div
                class="${themeClassName}${cls('defaultUI')}${displayClassName}"
                ref=${(el: HTMLElement) => (this.refs.el = el)}
            >
                <${Toolbar}
                    ref=${(toolbar: Toolbar) => (this.toolbar = toolbar)}
                    hideToolbar=${hideToolbar}
                    eventEmitter=${eventEmitter}
                    previewStyle=${previewStyle}
                    toolbarItems=${toolbarItems}
                    editorType=${editorType}
                />
                <div
                    class="${cls('main')} ${editorTypeClassName}"
                    ref=${(el: HTMLElement) => (this.refs.editorSection = el)}
                >
                    <div class="${cls('main-container')}">
                        <div
                            class="${cls('md-container')} ${previewClassName}"
                            ref=${(el: HTMLElement) => (this.refs.mdContainer = el)}
                        >
                            <div class="${cls('md-splitter')}"></div>
                        </div>
                        <div
                            class="${cls('ww-container')}"
                            ref=${(el: HTMLElement) => (this.refs.wwContainer = el)}
                        />
                    </div>
                </div>
                ${!hideModeSwitch &&
                html`<${Switch} eventEmitter=${eventEmitter} editorType=${editorType} />`}
                <${ContextMenu} eventEmitter=${eventEmitter} />
            </div>
        `;
    }

    addEvent() {
        const { eventEmitter } = this.props;

        eventEmitter.listen('hide', this.hide);
        eventEmitter.listen('show', this.show);
        eventEmitter.listen('changeMode', this.changeMode);
        eventEmitter.listen('changePreviewStyle', this.changePreviewStyle);
    }

    private changeMode = (editorType: EditorType) => {
        if (editorType !== this.state.editorType) {
            this.setState({ editorType });
        }
    };

    private changePreviewStyle = (previewStyle: PreviewStyle) => {
        if (previewStyle !== this.state.previewStyle) {
            this.setState({ previewStyle });
        }
    };

    private hide = () => {
        this.setState({ hide: true });
    };

    private show = () => {
        this.setState({ hide: false });
    };
}
