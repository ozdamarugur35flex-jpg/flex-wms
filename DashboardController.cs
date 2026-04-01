using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace FlexWms.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DashboardController : ControllerBase
    {
        [HttpGet("logs")]
        public IActionResult GetLogs()
        {
            // Frontend'deki 404 hatasını gidermek için boş bir liste dönüyoruz.
            return Ok(new List<object>());
        }
    }
}
