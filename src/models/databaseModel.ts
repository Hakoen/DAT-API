export abstract class DatabaseModel<T> {
	public abstract toClientModel(): T;
}
