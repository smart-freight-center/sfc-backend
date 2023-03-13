const PATTERNS = {
  body: /.*(-\s[^\n]+\n{0,1})+/,
  footer: /([Cc]loses|[iI]mplements|[fF]ixes|[rR]elates to) #\d+$/,
  exampleFooter: 'closes #23', //closes #{issue-number}
  exampleBody: '\n- hello\n- world\n',
};

module.exports = {
  // for custom rules -> https://commitlint.js.org/#/reference-rules
  extends: ['@commitlint/config-conventional'],
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    'body-empty': [0], // disabled
    'subject-case': [0], // disabled
    'function-rules/footer-empty': [
      2, // error
      'always',
      (parsed) => {
        if (!parsed.footer || parsed.footer == '') {
          return [true];
        } else {
          return PATTERNS.footer.test(parsed.footer)
            ? [true]
            : [
                false,
                `The footer should follow the pattern: '${PATTERNS.exampleFooter}'. See comitlint.config.js for full footer pattern. Note that it si also optional`,
              ];
        }
      },
    ],
    'function-rules/body-empty': [
      2, // error
      'always',
      (parsed) => {
        if (!parsed.body || parsed.body == '') {
          return [true];
        } else {
          return PATTERNS.body.test(parsed.body)
            ? [true]
            : [
                false,
                `The body should be a new-line spearated hyphenated list. e.g ${PATTERNS.exampleBody}`,
              ];
        }
      },
    ],
  },
};
