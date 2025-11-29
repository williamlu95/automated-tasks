export type TellerAccount = {
  id: string;
  enrollment_id: string;
  currency: string;
  last_four: string;
  name: string;
  type: 'depository' | 'credit';
  subtype:
    | 'checking'
    | 'savings'
    | 'money_market'
    | 'certificate_of_deposit'
    | 'treasury'
    | 'sweep'
    | 'credit_card';
  status: 'open' | 'closed';

  institution: {
    id: string;
    name: string;
  };

  links: {
    self: string;
    details: string;
    balances: string;
    transactions: string;
  };
}

export type TellerAccountBalance = {
  ledger: string | null;
  account_id: string;
  available: string | null;
  links: {
    self: string;
    account: string;
  }
}

export type TellerTransaction = {
  id: string;
  account_id: string;
  amount: string;
  date: string;
  description: string;
  type: string;
  status: 'posted' | 'pending';
  running_balance: string | null;
  details: {
    processing_status: 'pending' | 'complete';
    category:
      | 'accommodation'
      | 'advertising'
      | 'bar'
      | 'charity'
      | 'clothing'
      | 'dining'
      | 'education'
      | 'electronics'
      | 'entertainment'
      | 'fuel'
      | 'general'
      | 'groceries'
      | 'health'
      | 'home'
      | 'income'
      | 'insurance'
      | 'investment'
      | 'loan'
      | 'office'
      | 'phone'
      | 'service'
      | 'shopping'
      | 'software'
      | 'sport'
      | 'tax'
      | 'transport'
      | 'transportation'
      | 'utilities'
      | null;
    counterparty: {
      name: string | null;
      type: 'organization' | 'person' | null;
    };
  };
  links: {
    self: string;
    account: string;
  };
}
