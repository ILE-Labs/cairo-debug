#[starknet::interface]
pub trait IHelloStarknet<TContractState> {
    fn increase_balance(ref self: TContractState, amount: felt252);
    fn get_balance(self: @TContractState) -> felt252;
}

#[starknet::contract]
mod HelloStarknet {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::syscalls::storage_read_syscall;
    use starknet::storage_access::StorageAddress;

    #[storage]
    struct Storage {
        balance: felt252,
    }

    #[abi(embed_v0)]
    impl HelloStarknetImpl of super::IHelloStarknet<ContractState> {

        fn increase_balance(ref self: ContractState, amount: felt252) {
            // ✅ Correct type for syscall
            let key: StorageAddress = StorageAddress::from_felt252(0);

            let result = storage_read_syscall(0, key);

            // ❌ Intentional misuse: treat SyscallResult as felt
            let value: felt252 = result;

            self.balance.write(value + amount);
        }

        fn get_balance(self: @ContractState) -> felt252 {
            self.balance.read()
        }
    }
}