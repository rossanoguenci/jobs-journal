export default function daysFromDate(date: string) {
    if (date.length < 10) {
        return null
    }
    const givenDate = new Date(date);
    if (isNaN(givenDate.getTime())) {
        return null;
    }
    const today = new Date();
    const diff = today.getTime() - givenDate.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
