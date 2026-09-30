

// export default function Pagination(){
//     return(
//         {/* Pagination */}
//       {data && data.totalPages > 1 && (
//         <div className="flex items-center justify-between mt-6">
//           <p className="text-sm text-gray-600">
//             Showing {(currentPage - 1) * limit + 1} to{" "}
//             {Math.min(currentPage * limit, data.totalCount)} of{" "}
//             {data.totalCount} results
//           </p>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="w-4 h-4" />
//             </Button>
//             {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
//               (page) => (
//                 <Button
//                   key={page}
//                   variant={currentPage === page ? "default" : "outline"}
//                   size="sm"
//                   onClick={() => setCurrentPage(page)}
//                 >
//                   {page}
//                 </Button>
//               )
//             )}
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() =>
//                 setCurrentPage((p) => Math.min(data.totalPages, p + 1))
//               }
//               disabled={currentPage === data.totalPages}
//             >
//               <ChevronRight className="w-4 h-4" />
//             </Button>
//           </div>
//         </div>
//       )}
//     )
// }