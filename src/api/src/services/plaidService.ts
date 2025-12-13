import { 
  Configuration, 
  PlaidApi, 
  PlaidEnvironments, 
  Products, 
  CountryCode,
  LinkTokenCreateRequest,
  ItemPublicTokenExchangeRequest,
  AccountsGetRequest,
  TransactionsGetRequest,
  InstitutionsGetByIdRequest
} from 'plaid';
import { TRPCError } from '@trpc/server';

// Plaid configuration
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.warn('⚠️  Plaid credentials not configured. Bank integration will not work.');
}

// Map environment string to Plaid environment
const getPlaidEnvironment = (env: string) => {
  switch (env.toLowerCase()) {
    case 'production':
      return PlaidEnvironments.production;
    case 'development':
      return PlaidEnvironments.development;
    case 'sandbox':
    default:
      return PlaidEnvironments.sandbox;
  }
};

const configuration = new Configuration({
  basePath: getPlaidEnvironment(PLAID_ENV),
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

export interface PlaidLinkTokenRequest {
  userId: string;
  clientName?: string;
}

export interface PlaidExchangeTokenRequest {
  publicToken: string;
  userId: string;
}

export interface PlaidAccountsRequest {
  accessToken: string;
}

export interface PlaidTransactionsRequest {
  accessToken: string;
  startDate: string;
  endDate: string;
}

export class PlaidService {
  /**
   * Create a link token for Plaid Link initialization
   */
  static async createLinkToken({ userId, clientName = 'Coinly Financial Planner' }: PlaidLinkTokenRequest) {
    try {
      const request: LinkTokenCreateRequest = {
        user: {
          client_user_id: userId,
        },
        client_name: clientName,
        products: [Products.Transactions, Products.Auth],
        country_codes: [CountryCode.Us],
        language: 'en',
        webhook: process.env.PLAID_WEBHOOK_URL,
        redirect_uri: process.env.PLAID_REDIRECT_URI,
      };

      const response = await plaidClient.linkTokenCreate(request);
      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
      };
    } catch (error: any) {
      console.error('Plaid link token creation failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create Plaid link token',
        cause: error,
      });
    }
  }

  /**
   * Exchange public token for access token
   */
  static async exchangePublicToken({ publicToken, userId }: PlaidExchangeTokenRequest) {
    try {
      const request: ItemPublicTokenExchangeRequest = {
        public_token: publicToken,
      };

      const response = await plaidClient.itemPublicTokenExchange(request);
      
      return {
        accessToken: response.data.access_token,
        itemId: response.data.item_id,
        userId,
      };
    } catch (error: any) {
      console.error('Plaid token exchange failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to exchange Plaid token',
        cause: error,
      });
    }
  }

  /**
   * Get account information
   */
  static async getAccounts({ accessToken }: PlaidAccountsRequest) {
    try {
      const request: AccountsGetRequest = {
        access_token: accessToken,
      };

      const response = await plaidClient.accountsGet(request);
      
      return {
        accounts: response.data.accounts.map(account => ({
          accountId: account.account_id,
          name: account.name,
          officialName: account.official_name,
          type: account.type,
          subtype: account.subtype,
          mask: account.mask,
          balances: {
            available: account.balances.available,
            current: account.balances.current,
            limit: account.balances.limit,
            isoCurrencyCode: account.balances.iso_currency_code,
          },
        })),
        item: response.data.item,
      };
    } catch (error: any) {
      console.error('Plaid accounts fetch failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch account information',
        cause: error,
      });
    }
  }

  /**
   * Get transactions for a date range
   */
  static async getTransactions({ accessToken, startDate, endDate }: PlaidTransactionsRequest) {
    try {
      const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
      };

      const response = await plaidClient.transactionsGet(request);
      
      return {
        transactions: response.data.transactions.map(transaction => ({
          transactionId: transaction.transaction_id,
          accountId: transaction.account_id,
          amount: transaction.amount,
          isoCurrencyCode: transaction.iso_currency_code,
          date: transaction.date,
          name: transaction.name,
          merchantName: transaction.merchant_name,
          category: transaction.category,
          subcategory: transaction.category?.[0],
          type: transaction.transaction_type,
          pending: transaction.pending,
          accountOwner: transaction.account_owner,
        })),
        totalTransactions: response.data.total_transactions,
        accounts: response.data.accounts,
      };
    } catch (error: any) {
      console.error('Plaid transactions fetch failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch transactions',
        cause: error,
      });
    }
  }

  /**
   * Get institution information
   */
  static async getInstitution(institutionId: string) {
    try {
      const request: InstitutionsGetByIdRequest = {
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      };

      const response = await plaidClient.institutionsGetById(request);
      
      return {
        institution: {
          institutionId: response.data.institution.institution_id,
          name: response.data.institution.name,
          products: response.data.institution.products,
          countryCodes: response.data.institution.country_codes,
          url: response.data.institution.url,
          primaryColor: response.data.institution.primary_color,
          logo: response.data.institution.logo,
        },
      };
    } catch (error: any) {
      console.error('Plaid institution fetch failed:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch institution information',
        cause: error,
      });
    }
  }
}