import React from 'react';

function PageTitle({ title }) {
    return (
        <div>
            <h1 className="text-md uppercase">{title}</h1>
        </div>
    );
}

export default PageTitle;