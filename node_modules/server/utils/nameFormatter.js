export const formatName = (firstName, lastName, roleName, gender) => {
    const fName = firstName || '';
    const lName = lastName || '';
    let name = `${fName} ${lName}`.trim();
    if (!name) return '';

    const role = (roleName || '').toLowerCase();
    const gen = (gender || '').toLowerCase();

    if (role === 'doctor') {
        return `Dr. ${name}`;
    } else if (gen === 'male') {
        return `Mr. ${name}`;
    } else if (gen === 'female') {
        return `Mrs. ${name}`;
    }
    return name;
};
