import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const DataImport = () => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [file, setFile] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected");
            return;
        }

        setFile(file);
        setIsConfirmed(false); // Reset confirmation state for new files

        const reader = new FileReader();

        reader.onload = (e) => {
            const binaryStr = e.target.result;

            if (!binaryStr) {
                console.error("Failed to read file");
                return;
            }

            try {
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = jsonData[0];
                const rows = jsonData.slice(1);

                setColumns(headers.map(header => ({
                    Header: header,
                    accessor: header
                })));

                setData(
                    rows.map((row) => {
                        let rowData = {};
                        row.forEach((cell, i) => {
                            rowData[headers[i]] = cell;
                        });
                        return rowData;
                    })
                );
            } catch (error) {
                console.error("Error parsing file:", error);
            }
        };

        reader.onerror = (error) => {
            console.error("Error reading file:", error);
        };

        reader.readAsBinaryString(file);
    };

    const handleConfirm = async () => {
        setIsConfirmed(true);

        if (!file) {
            console.error("No file to upload");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        let url = process.env.NEXT_PUBLIC_API_URL + 'upload';
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const result = await response.json();
            console.log('File uploaded and data saved:', result.message);
        } catch (error) {
            console.error('Error uploading file:', error.message);
        }
    };

    const handleRestart = () => {
        setFile(null);
        setData([]);
        setColumns([]);
        setIsConfirmed(false);
    };

    const handleOnSuccess = () => (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
            <p className="font-semibold">Success!</p>
            <p>Data has been confirmed and is ready for submission.</p>
            <button
                onClick={handleRestart}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Upload New File
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Upload Excel Sheet</h1>

                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="mb-4 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {file && (
                    <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-md">
                        <strong className="text-gray-700">Selected file:</strong> {file.name}
                    </div>
                )}

                {data.length > 0 && !isConfirmed && (
                    <>
                        <div className="flex justify-between mb-4">
                            <button
                                onClick={handleConfirm}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Confirm and Save
                            </button>
                            <button
                                onClick={handleRestart}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-gray-200">
                                        {columns.map((column, index) => (
                                            <th key={index} className="px-4 py-2 text-left text-sm font-semibold text-gray-800 border-b">
                                                {column.Header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            {columns.map((column, colIndex) => (
                                                <td key={colIndex} className="px-4 py-2 text-sm text-gray-600 border-b">
                                                    {row[column.accessor]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {isConfirmed && handleOnSuccess()}
            </div>
        </div>
    );
};

export default DataImport;
