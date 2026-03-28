#[starknet::interface]
pub trait IHelloStarknet<TContractState> {
    fn increase_balance(ref self: TContractState, amount: felt252);
    fn get_balance(self: @TContractState) -> felt252;
}

#[starknet::contract]
mod HelloStarknet {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};

    #[storage]
    struct Storage {
        balance: felt252,
    }

    impl HelloStarknetImpl of super::IHelloStarknet<ContractState> {

        fn increase_balance(ref self: ContractState, amount: felt252) {
            let x: felt252 = 10;

            let y: u32 = x;

            self.balance.write(amount);
        }

        fn get_balance(self: @ContractState) -> felt252 {
            self.balance.read()
        }
    }
}