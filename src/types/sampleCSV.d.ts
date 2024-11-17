declare interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

declare interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

declare interface Geo {
  lat: string;
  lng: string;
}

declare interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}
