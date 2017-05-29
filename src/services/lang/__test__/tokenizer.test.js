import {
  BANG,
  BRACE_L,
  BRACE_R,
  COLON,
  COMMENT,
  DOLLAR,
  EOF,
  FLOAT,
  INT,
  NAME,
  PAREN_L,
  PAREN_R,
  STRING,
  createLexer,
} from '../types/lexer';

// subchild {
//   subproperty: 3;
// }

const code = `

type Episode {
  id: ID!
  name: String
}

"teste"
123
123.42
.3

#test
query getMyPosts($id: Int!, $limit: Int) { # a comment
  post($id, $limit) {
    name
  }
}

`;

describe('Tokenizer', () => {
  it('should read tokens values', () => {
    const tokens = [];
    const lexer = createLexer(code);

    while (lexer.next({ includeComments: true }).type !== EOF) {
      const token = lexer.token;
      const t = { type: token.type, line: token.line, start: token.start, end: token.end };

      if (token.value) {
        t.value = token.value;
      }

      tokens.push(t);
    }

    /* eslint-disable no-multi-spaces */
    expect(tokens).toEqual([
      { type: NAME,    line: 3, start: 2,   end: 6,   value: 'type'        },
      { type: NAME,    line: 3, start: 7,   end: 14,  value: 'Episode'     },
      { type: BRACE_L, line: 3, start: 15,  end: 16                        },
      { type: NAME,    line: 4, start: 19,  end: 21,  value: 'id'          },
      { type: COLON,   line: 4, start: 21,  end: 22                        },
      { type: NAME,    line: 4, start: 23,  end: 25,  value: 'ID'          },
      { type: BANG,    line: 4, start: 25,  end: 26                        },
      { type: NAME,    line: 5, start: 29,  end: 33,  value: 'name'        },
      { type: COLON,   line: 5, start: 33,  end: 34                        },
      { type: NAME,    line: 5, start: 35,  end: 41,  value: 'String'      },
      { type: BRACE_R, line: 6, start: 42,  end: 43                        },
      { type: STRING,  line: 8, start: 45,  end: 52,  value: 'teste'       },
      { type: INT,     line: 9, start: 53,  end: 56,  value: '123'         },
      { type: FLOAT,   line: 10, start: 57,  end: 63,  value: '123.42'     },
      { type: FLOAT,   line: 11, start: 64,  end: 66,  value: '.3'         },
      { type: COMMENT, line: 13, start: 68,  end: 73,  value: 'test' },
      { type: NAME,    line: 14, start: 74,  end: 79,  value: 'query'      },
      { type: NAME,    line: 14, start: 80,  end: 90,  value: 'getMyPosts' },
      { type: PAREN_L, line: 14, start: 90,  end: 91                       },
      { type: DOLLAR,  line: 14, start: 91,  end: 92                       },
      { type: NAME,    line: 14, start: 92,  end: 94,  value: 'id'         },
      { type: COLON,   line: 14, start: 94,  end: 95                       },
      { type: NAME,    line: 14, start: 96,  end: 99,  value: 'Int'        },
      { type: BANG,    line: 14, start: 99,  end: 100                       },
      { type: DOLLAR,  line: 14, start: 102, end: 103                      },
      { type: NAME,    line: 14, start: 103, end: 108, value: 'limit'      },
      { type: COLON,   line: 14, start: 108, end: 109                      },
      { type: NAME,    line: 14, start: 110, end: 113, value: 'Int'        },
      { type: PAREN_R, line: 14, start: 113, end: 114                      },
      { type: BRACE_L, line: 14, start: 115, end: 116                      },
      { type: COMMENT, line: 14, start: 117, end: 128, value: ' a comment' },
      { type: NAME,    line: 15, start: 131, end: 135, value: 'post'       },
      { type: PAREN_L, line: 15, start: 135, end: 136                      },
      { type: DOLLAR,  line: 15, start: 136, end: 137                      },
      { type: NAME,    line: 15, start: 137, end: 139, value: 'id'         },
      { type: DOLLAR,  line: 15, start: 141, end: 142                      },
      { type: NAME,    line: 15, start: 142, end: 147, value: 'limit'      },
      { type: PAREN_R, line: 15, start: 147, end: 148                      },
      { type: BRACE_L, line: 15, start: 149, end: 150                      },
      { type: NAME,    line: 16, start: 155, end: 159, value: 'name'       },
      { type: BRACE_R, line: 17, start: 162, end: 163                      },
      { type: BRACE_R, line: 18, start: 164, end: 165                      },
    ]);
    /* eslint-enable no-multi-spaces */
  });
});
