// GraphQL documents for the pinned Storefront API version. Every query
// is @inContext-aware so Shopify Markets serves the right currency for
// the buyer's region (IN → INR, US → USD).

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    availableForSale
    featuredImage {
      url
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        id
      }
    }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      nodes {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            price {
              amount
              currencyCode
            }
            product {
              title
              handle
              featuredImage {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_BY_COLLECTION_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductsByCollection($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    collection(handle: $handle) {
      products(first: 100) {
        nodes {
          ...ProductFields
        }
      }
    }
  }
`;

export const PRODUCTS_BY_HANDLES_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductsByHandles($query: String!, $country: CountryCode!) @inContext(country: $country) {
    products(first: 100, query: $query) {
      nodes {
        ...ProductFields
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!, $country: CountryCode!) @inContext(country: $country) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!, $country: CountryCode!) @inContext(country: $country) {
    cartCreate(input: { lines: $lines, buyerIdentity: { countryCode: $country } }) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $country: CountryCode!) @inContext(country: $country) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_FETCH_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query CartFetch($cartId: ID!, $country: CountryCode!) @inContext(country: $country) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

export const CART_BUYER_IDENTITY_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartBuyerIdentityUpdate($cartId: ID!, $country: CountryCode!) @inContext(country: $country) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: { countryCode: $country }) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;
