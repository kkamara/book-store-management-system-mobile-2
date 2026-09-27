# The Book Nook

Mobile storefront for the [Book Store Management System](https://github.com/kkamara/book-store-management-system-2). Browse and search books, read reviews, manage a cart, view orders, and update your account.

## Setup

Install dependencies and create the local environment file:

```powershell
Copy-Item .env.example .env
yarn install
```

Set `EXPO_PUBLIC_WEB_API` to the Laravel mobile API base URL. The example uses `10.0.2.2` for the Android emulator; web requests automatically map that host to `localhost`.

## Run

```bash
yarn start
yarn android
yarn ios
yarn web
```

Checkout is not available until the backend provides an order-creation endpoint.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[BSD](https://opensource.org/licenses/BSD-3-Clause)
