export abstract class DatabaseModel<T> {
	abstract toClientModel(): T;
}
