export const wait = async (time: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}