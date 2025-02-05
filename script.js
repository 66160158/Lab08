// Blog Class - รับผิดชอบจัดการข้อมูลบล็อก
class Blog {
    constructor(id, title, content, tags) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.tags = tags || []; // เพิ่ม tags
      this.createdDate = new Date();
      this.updatedDate = new Date();
    }
    update(title, content, tags) {
      this.title = title;
      this.content = content;
      this.tags = tags || []; // อัปเดต tags
      this.updatedDate = new Date();
    }
    getFormattedDate() {
      return this.updatedDate.toLocaleString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }
  
  // BlogManager Class - รับผิดชอบจัดการ array ของบล็อก
  class BlogManager {
    constructor() {
      // ดึงข้อมูลบล็อกจาก localStorage หรือเริ่มต้นเป็นอาร์เรย์ว่าง ๆ
      this.blogs = JSON.parse(localStorage.getItem("blogs")) || [];
      this.filteredBlogs = this.blogs; // สำหรับเก็บบล็อกที่กรองแล้ว
    }
  
    addBlog(title, content, tags) {
      const blog = new Blog(Date.now(), title, content, tags);
      this.blogs.push(blog);
      this.filteredBlogs = this.blogs; // รีเซ็ตการกรอง
      this.sortBlogs();
      this.saveBlogs(); // บันทึกข้อมูลบล็อกลง localStorage
      return blog;
    }
  
    updateBlog(id, title, content, tags) {
      const blog = this.getBlog(id);
      if (blog) {
        blog.update(title, content, tags);
        this.sortBlogs();
        this.saveBlogs(); // บันทึกข้อมูลบล็อกลง localStorage
      }
      return blog;
    }
  
    deleteBlog(id) {
      this.blogs = this.blogs.filter((blog) => blog.id !== id);
      this.filteredBlogs = this.blogs; // รีเซ็ตการกรอง
      this.saveBlogs(); // บันทึกข้อมูลบล็อกลง localStorage
    }
  
    getBlog(id) {
      return this.blogs.find((blog) => blog.id === id);
    }
  
    sortBlogs() {
      this.blogs.sort((a, b) => b.updatedDate - a.updatedDate);
      this.filteredBlogs = this.blogs; // รีเซ็ตการกรอง
    }
  
    filterBlogsByTag(tag) {
      if (tag) {
        this.filteredBlogs = this.blogs.filter((blog) =>
          blog.tags.includes(tag)
        );
      } else {
        this.filteredBlogs = this.blogs; // ถ้าไม่มีการกรอง ให้แสดงบล็อกทั้งหมด
      }
    }
  
    saveBlogs() {
      localStorage.setItem("blogs", JSON.stringify(this.blogs)); // บันทึกข้อมูลบล็อกทั้งหมดลงใน localStorage
    }
  }
  
  // UI Class - รับผิดชอบจัดการ DOM และ Events
  class BlogUI {
    constructor(blogManager) {
      this.blogManager = blogManager;
      this.initElements();
      this.initEventListeners();
      this.render();
    }
  
    initElements() {
      this.form = document.getElementById("blog-form");
      this.titleInput = document.getElementById("title");
      this.contentInput = document.getElementById("content");
      this.tagsInput = document.getElementById("tags"); // ฟิลด์สำหรับ Tags
      this.editIdInput = document.getElementById("edit-id");
      this.formTitle = document.getElementById("form-title");
      this.cancelBtn = document.getElementById("cancel-btn");
      this.blogList = document.getElementById("blog-list");
      this.tagFilterSelect = document.getElementById("tag-filter"); // ตัวกรอง Tags
    }
  
    initEventListeners() {
      // จัดการ submit form
      this.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
  
      // จัดการปุ่มยกเลิก
      this.cancelBtn.addEventListener("click", () => {
        this.resetForm();
      });
  
      // ฟังการเลือก Tag จากตัวกรอง
      this.tagFilterSelect.addEventListener("change", (e) => {
        const selectedTag = e.target.value;
        this.blogManager.filterBlogsByTag(selectedTag);
        this.render();
      });
    }
  
    handleSubmit() {
      const title = this.titleInput.value.trim();
      const content = this.contentInput.value.trim();
      const tags = this.tagsInput.value
        .trim()
        .split(",")
        .map((tag) => tag.trim()); // แยก Tags ด้วยคอมม่า
      const editId = parseInt(this.editIdInput.value);
  
      if (title && content) {
        if (editId) {
          this.blogManager.updateBlog(editId, title, content, tags);
        } else {
          this.blogManager.addBlog(title, content, tags);
        }
        this.resetForm();
        this.render();
      }
    }
  
    editBlog(id) {
      const blog = this.blogManager.getBlog(id);
      if (blog) {
        this.titleInput.value = blog.title;
        this.contentInput.value = blog.content;
        this.tagsInput.value = blog.tags.join(", "); // แสดง Tags ที่เลือกในฟอร์ม
        this.editIdInput.value = blog.id;
        this.formTitle.textContent = "แก้ไขบล็อก";
        this.cancelBtn.classList.remove("hidden");
        window.scrollTo(0, 0);
      }
    }
  
    deleteBlog(id) {
      if (confirm("ต้องการลบบล็อกใช่หรือไม่?")) {
        this.blogManager.deleteBlog(id);
        this.render();
      }
    }
  
    resetForm() {
      this.form.reset();
      this.editIdInput.value = "";
      this.formTitle.textContent = "เขียนบล็อกให้";
      this.cancelBtn.classList.add("hidden");
    }
  
    render() {
        // กรองบล็อกก่อนการแสดงผล
        this.blogList.innerHTML = this.blogManager.filteredBlogs
          .map(
            (blog) => {
              if (!(blog instanceof Blog)) {
                console.error("Expected instance of Blog, but got:", blog);
                return ''; // หากไม่ใช่ instance ของ Blog จะไม่แสดงอะไร
              }
              return `
              <div class="blog-post">
                <h2 class="blog-title">${blog.title}</h2>
                <div class="blog-date">อัพเดทเมื่อ: ${blog.getFormattedDate()}</div>
                <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                <div class="blog-tags">
                  <strong>Tags:</strong> ${blog.tags.join(", ")}
                </div>
                <div class="blog-actions">
                  <button class="btn-edit" onclick="blogUI.editBlog(${blog.id})">แก้ไข</button>
                  <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                </div>
              </div>
            `
            }
          )
          .join("");
      }
      
  }
  
  // สร้างตัวเลือก Tags สำหรับกรอง
  function populateTagFilter() {
    const tags = new Set();
    blogManager.blogs.forEach((blog) => {
      blog.tags.forEach((tag) => {
        tags.add(tag);
      });
    });
  
    const tagFilter = document.getElementById("tag-filter");
    tagFilter.innerHTML = `<option value="">ทั้งหมด</option>`; // เพิ่มตัวเลือก "ทั้งหมด"
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
  }
  
  // เริ่มต้นการทำงาน
  const blogManager = new BlogManager();
  const blogUI = new BlogUI(blogManager);
  
  // สร้างตัวเลือก Tags สำหรับกรองเมื่อโหลดหน้าเว็บ
  populateTagFilter();
  