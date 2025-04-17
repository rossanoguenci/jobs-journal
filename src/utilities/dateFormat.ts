export default function dateFormat(date: string) {
    if (date.length < 10) {
        return null;
    }
    const [year, month, day] = date.split("-");
    return (`${day}-${month}-${year}`);
}