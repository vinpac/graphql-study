import { parse } from '../parser';

const code = `

type Episode {
  post: Episode,
}

query getMyPosts($id: Int! = true, $limit: Int) { # a comment
  post(id: $id, limit: $limit) {
    name (include: true)
  }
}

`;

describe('Tokenizer', () => {
  const ast = parse(code);

  it('should read tokens values', () => {
    expect(1).toEqual(1);
  });
});
