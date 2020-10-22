import React from 'react';
import utils from '../../../../../../utils';

interface IPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface Props {
  padding?: string;
  onEnter: (...args: any) => void;
  placeholder?: string;
  lineHeight?: string;
  fontSize?: string;
  maxRows: number;
}

class ChatInput extends React.Component<Props> {
  maxHeight: number;
  lineHeightVal: number;
  padding: IPadding;
  height: number;
  textarea: HTMLTextAreaElement;

  static defaultProps = {
    fontSize: '16px',
    lineHeight: '20px',
    padding: '8px 12px',
    maxRows: 4,
    placeholder: 'Type your message',
    onEnter: () => {},
  };

  constructor(props: Props) {
    super(props);
    this.extractPaddingValues();
    this.lineHeightVal = Number.parseInt(props.lineHeight);

    /** set initial and calculate max height */
    this.maxHeight =
      props.maxRows * this.lineHeightVal +
      this.padding.top +
      this.padding.bottom;
    this.height = this.padding.top + this.padding.bottom + this.lineHeightVal;
  }

  /** We need to extract exact padding values in order to set proper [max]height */
  extractPaddingValues() {
    const { padding } = this.props;
    const matches = padding.match(/(\d+)/g).map(Number);
    switch (matches.length) {
      case 1: {
        const [value] = matches;
        this.padding = {
          top: value,
          right: value,
          bottom: value,
          left: value,
        };
        break;
      }

      case 2: {
        const [valueY, valueX] = matches;
        this.padding = {
          top: valueY,
          right: valueX,
          bottom: valueY,
          left: valueX,
        };
        break;
      }

      case 3: {
        const [valueTop, valueX, valueBottom] = matches;
        this.padding = {
          top: valueTop,
          right: valueX,
          bottom: valueBottom,
          left: valueX,
        };
        break;
      }

      case 4: {
        const [valueTop, valueRight, valueBottom, valueLeft] = matches;
        this.padding = {
          top: valueTop,
          right: valueRight,
          bottom: valueBottom,
          left: valueLeft,
        };
        break;
      }
    }
  }

  onKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.key === 'Enter') {
      if (!utils.isTouchDevice()) {
        /** desktop environment */
        if (!ev.shiftKey) {
          /** Only enter was pressed */
          ev.preventDefault();
          this.props.onEnter();
        }
      }
    }

    this.resize();
  };

  resize = () =>
    /** Put the resize function at the end of the event loop
     *  in order to give textarea a time to rerender
     */
    setTimeout(() => {
      const el = this.textarea;
      el.style.height = '0';
      const { scrollHeight } = el;
      const newHeight =
        scrollHeight -
        ((scrollHeight - (this.padding.top + this.padding.bottom)) %
          this.lineHeightVal);
      el.style.height = newHeight + 'px';
      if (newHeight <= this.maxHeight) {
        el.style.overflow = 'hidden';
      } else {
        el.style.overflow = 'auto';
      }
    }, 0);

  render() {
    const { fontSize, lineHeight, padding, placeholder } = this.props;

    return (
      <textarea
        ref={(textarea) => (this.textarea = textarea)}
        style={{
          fontSize,
          lineHeight,
          padding,
          height: this.height,
          maxHeight: this.maxHeight,
        }}
        onKeyDown={this.onKeyDown}
        spellCheck={false}
        name="text"
        autoComplete="false"
        placeholder={placeholder}
        rows={1}
        className="chat__input"
      />
    );
  }
}

export default ChatInput;
