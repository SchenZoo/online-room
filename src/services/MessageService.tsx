import React from 'react';
import { Message } from '../pages/Meet/components/Chat/Chat.component';
import utils from '../utils';

export default {
  parseMsg(msg: Message) {
    this.linkify(msg);
  },

  parseMessages(msgs: Message[]) {
    msgs.forEach((msg) => this.parseMsg(msg));
  },

  linkify(msg: Message, newTab = true) {
    const linkified = utils.linkify(msg.text as string, newTab);
    msg.text = Array.isArray(linkified)
      ? linkified.map((el, ind) =>
          React.isValidElement(el)
            ? React.cloneElement(el, { key: ind })
            : React.cloneElement(<>{el}</>, { key: ind }),
        )
      : linkified;
  },
};
